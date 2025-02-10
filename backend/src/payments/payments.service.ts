import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { Payment } from "./entities/payment.entity";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { House } from "../houses/entities/house.entity";
import { Tenant } from "../tenants/entities/tenant.entity";
import { calculateMoney } from "../utils/decimal.util";
@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(House)
    private readonly houseRepository: Repository<House>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>
  ) {}

  async findAll() {
    return await this.paymentRepository.find({
      relations: ["house", "tenant"],
    });
  }

  async findOne(id: number) {
    return await this.paymentRepository.findOne({
      where: { id },
      relations: ["house", "tenant"],
    });
  }

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    try {
      const house = await this.houseRepository.findOne({
        where: { id: createPaymentDto.houseId },
        relations: ["tenant"],
      });

      if (!house) {
        throw new NotFoundException("房屋不存在");
      }

      // 获取当前租户
      const tenant = house.tenant;
      if (!tenant) {
        throw new BadRequestException("房屋未出租，无法创建缴费记录");
      }

      // 获取最后一次缴费记录
      const lastPayment = await this.paymentRepository.findOne({
        where: { houseId: house.id },
        order: { createdAt: "DESC" },
      });

      const payment = this.paymentRepository.create({
        ...createPaymentDto,
        tenantId: tenant.id, // 绑定租户 ID
        previousWaterUsage:
          lastPayment?.waterUsage ?? house.initialWaterReading,
        previousElectricityUsage:
          lastPayment?.electricityUsage ?? house.initialElectricityReading,
      });

    // 计算本次应缴总额（房租 + 水费 + 电费 + 其他费用）
    const expectedAmount = calculateMoney.add(
      house.baseRent,
      calculateMoney.add(
        calculateMoney.multiply(calculateMoney.subtract(payment.waterUsage, lastPayment?.waterUsage || 0), house.waterRate),
        calculateMoney.multiply(
          calculateMoney.subtract(payment.electricityUsage, lastPayment?.electricityUsage || 0),
          house.electricityRate
        )
      )
    );

      // 计算余额
      const balance = lastPayment ? lastPayment.balance : 0;
      payment.balance = calculateMoney.subtract(
        payment.amount,
        calculateMoney.add(expectedAmount, balance)
      );


      return await this.paymentRepository.save(payment);
    } catch (error) {
      throw new Error(`创建缴费记录失败: ${error.message}`);
    }
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.findOne(id);
    if (!payment) {
      throw new BadRequestException("支付记录不存在");
    }
    // 使用 Object.assign 更新实体
    Object.assign(payment, {
      ...updatePaymentDto,
    });
    // 保存更新后的实体
    return await this.paymentRepository.save(payment);
  }

  async remove(id: number) {
    const payment = await this.findOne(id);
    return await this.paymentRepository.remove(payment);
  }

  async findByHouse(houseId: number, userId?: number): Promise<Payment[]> {
    const house = await this.houseRepository.findOne({
      where: { id: houseId },
    });
    if (!house) {
      throw new BadRequestException("房屋不存在");
    }

    const query = this.paymentRepository
      .createQueryBuilder("payment")
      .where("payment.houseId = :houseId", { houseId });

    // 如果传入了 userId，则只返回该用户的缴费记录
    if (userId) {
      query.andWhere("payment.tenantId = :userId", { userId });
    }

    return query.orderBy("payment.createdAt", "DESC").getMany();
  }

  async getStatistics() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const monthlyPayments = await this.paymentRepository.find({
      where: {
        createdAt: Between(firstDayOfMonth, lastDayOfMonth),
      },
    });

    const statistics = {
      totalIncome: 0,
      monthlyIncome: 0,
      rentIncome: 0,
      utilityIncome: 0,
      paymentsByCategory: {
        baseRent: 0,
        waterFee: 0,
        electricityFee: 0,
        other: 0,
      },
    };

    monthlyPayments.forEach((payment) => {
      statistics.monthlyIncome += Number(payment.amount);

      if (payment.baseRent) {
        statistics.paymentsByCategory.baseRent += Number(payment.baseRent);
        statistics.rentIncome += Number(payment.baseRent);
      }

      const utilityFees =
        Number(payment.amount) - Number(payment.baseRent || 0);
      if (utilityFees > 0) {
        statistics.utilityIncome += utilityFees;
        statistics.paymentsByCategory.other += utilityFees;
      }
    });

    return statistics;
  }

  async getBalance(houseId: number): Promise<number> {
    const lastPayment = await this.paymentRepository.findOne({
      where: { houseId },
      order: { createdAt: "DESC" },
    });
    return lastPayment?.balance || 0;
  }

  async findByTenant(tenantId: number): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { tenantId },
      order: { createdAt: "DESC" },
      relations: ["house"],
    });
  }

  async getHousePaymentStatus(houseId: number) {
    const house = await this.houseRepository.findOne({
      where: { id: houseId },
      relations: ["tenant"],
    });
    if (!house || !house.tenant) {
      return {
        status: "no_tenant",
        amount: 0,
        lastPaymentDate: null,
        monthsDiff: 0,
      };
    }

    // 获取最近一次缴费记录
    const lastPayment = await this.paymentRepository.findOne({
      where: { houseId },
      order: { createdAt: "DESC" },
    });

    if (!lastPayment) {
      return {
        status: "no_tenant",
        amount: 0,
        lastPaymentDate: null,
        monthsDiff: 0,
      };
    }

    // 计算应缴总额（房租 + 水费 + 电费 + 其他费用）
    const expectedAmount = calculateMoney.add(
      house.baseRent,
      calculateMoney.add(
        calculateMoney.multiply(lastPayment.waterUsage || 0, house.waterRate),
        calculateMoney.multiply(
          lastPayment.electricityUsage || 0,
          house.electricityRate
        )
      )
    );

    // 获取实际缴费总额
    const paidAmount = await this.paymentRepository
      .createQueryBuilder("payment")
      .where("payment.houseId = :houseId", { houseId })
      .select("SUM(payment.amount)", "total")
      .getRawOne()
      .then((result) => Number(result.total) || 0);

    const balance = calculateMoney.subtract(paidAmount, expectedAmount);

    return {
      status: balance >= 0 ? "paid" : "unpaid",
      amount: Math.abs(balance),
      lastPaymentDate: lastPayment?.createdAt || null,
      monthsDiff: 0,
    };
  }

  private calculateMonthsDiff(startDate: Date, endDate: Date): number {
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
    return months + endDate.getMonth() - startDate.getMonth();
  }

  async getHouseBalance(houseId: number): Promise<number> {
    try {
      const payments = await this.paymentRepository.find({
        where: { houseId },
        order: { createdAt: "DESC" },
      });

      if (payments.length === 0) {
        return 0;
      }

      return calculateMoney.format(payments[0].balance);
    } catch (error) {
      console.error("Failed to get house balance:", error);
      throw new InternalServerErrorException("获取房屋欠费信息失败");
    }
  }
}

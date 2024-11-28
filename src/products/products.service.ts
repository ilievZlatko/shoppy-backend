import { join } from 'path';
import { promises as fs } from 'fs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductRequest } from './dto/create-product.request';
import { PrismaService } from '@/prisma/prisma.service';
import { PRODUCT_IMAGES } from './product-images';
import { Prisma } from '@prisma/client';
import { ProductsGateway } from './products.gateway';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly productsGateway: ProductsGateway,
  ) {}

  private async imgExists(productId: string) {
    try {
      await fs.access(
        join(`${PRODUCT_IMAGES}/${productId}.jpg`),
        fs.constants.F_OK,
      );
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async createProduct(data: CreateProductRequest, userId: string) {
    const product = await this.prismaService.product.create({
      data: {
        ...data,
        userId,
      },
    });
    this.productsGateway.handleProductUpdated();
    return product;
  }

  async getProducts(status?: string) {
    const args: Prisma.ProductFindManyArgs = {};
    if (status === 'available') {
      args.where = {
        sold: false,
      };
    }
    const products = await this.prismaService.product.findMany(args);
    return Promise.all(
      products.map(async (product) => ({
        ...product,
        imageExists: await this.imgExists(product.id),
      })),
    );
  }

  async getProduct(productId: string) {
    try {
      const product = await this.prismaService.product.findUniqueOrThrow({
        where: {
          id: productId,
        },
      });

      return {
        ...product,
        imageExists: await this.imgExists(productId),
      };
    } catch (error) {
      console.error(error);
      throw new NotFoundException(`Product with ID: ${productId} not found`);
    }
  }

  async update(productId: string, data: Prisma.ProductUpdateInput) {
    await this.prismaService.product.update({
      where: {
        id: productId,
      },
      data,
    });
    this.productsGateway.handleProductUpdated();
  }
}

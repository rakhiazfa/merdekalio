import { Service } from "typedi";
import PrismaService from "./prisma.service";
import type { Menu } from "@prisma/client";
import type CreateMenuSchema from "@/schemas/create-menu.schema";
import type UpdateMenuSchema from "@/schemas/update-menu.schema";
import { NotFoundException } from "@/common/exceptions/not-found.exception";

@Service({ global: true })
class MenuService {
    constructor(private readonly prismaService: PrismaService) {}

    async findAll(): Promise<Menu[]> {
        const menus = await this.prismaService.menu.findMany({
            orderBy: {
                order: "asc",
            },
        });

        return this.formatMenus(menus);
    }

    async create(createMenuSchema: CreateMenuSchema): Promise<Menu> {
        const { name, uri, order, parentId } = createMenuSchema;

        const parent = parentId ? await this.findById(parentId) : null;
        const menu = await this.prismaService.menu.create({
            data: {
                name,
                uri,
                order,
                parent: {
                    connect: {
                        id: parent?.id,
                    },
                },
            },
        });

        return menu;
    }

    async findById(id: number): Promise<Menu> {
        const menu = await this.prismaService.menu.findUnique({
            where: { id: +id },
        });

        if (!menu) throw new NotFoundException(`Menu with id ${id} not found`);

        return menu;
    }

    async update(
        updateMenuSchema: UpdateMenuSchema,
        id: number
    ): Promise<Menu> {
        const { name, uri, order, parentId } = updateMenuSchema;

        const parent = parentId ? await this.findById(parentId) : null;
        const menu = this.prismaService.menu.update({
            where: { id: +id },
            data: {
                name,
                uri,
                order,
                parent: {
                    connect: {
                        id: parent?.id,
                    },
                },
            },
        });

        return menu;
    }

    async delete(id: number): Promise<Menu> {
        const menu = await this.prismaService.menu.delete({
            where: { id: +id },
        });

        return menu;
    }

    private formatMenus(
        menus: (Menu & { children?: Menu[] })[]
    ): (Menu & { children?: Menu[] })[] {
        menus = menus.map((menu) => ({
            ...menu,
            children: [],
        }));

        const getChildren = (parentId: number | null): Menu[] => {
            const children = menus.filter((menu) => menu.parentId === parentId);

            return children.map((menu) => ({
                ...menu,
                children: getChildren(menu.id),
            }));
        };

        return getChildren(null);
    }
}

export default MenuService;

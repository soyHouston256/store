import { ProductCartType } from "./ProductType";
import { UserType } from "./UserType";

export interface OrderType {
    id?: string;
    user?: UserType;
    total?: number;
    products?: ProductCartType[];
}

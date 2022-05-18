import Card from '@/components/Card';
import { useEffect, useState } from 'react';
import styled from "styled-components";
import { getItems } from '../aplications/api'
import Product from "../models/product";

function Products(): JSX.Element {
    const [productsList, setProductsList] = useState<Product[]>([]);
    console.log(productsList);
    useEffect(()=> {
        getProducts();
    },[onchange])

    const getProducts = async() => {
        const products = await getItems();
        setProductsList(products);
    }
    const ProductsGrid = styled.section`
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-gap: 25px;
        width: var(--screen-desktop);
		margin: 0 auto;
        margin-top: 40px;
    `

    return(
        <ProductsGrid>
            { productsList.map(({name, price, url}) => <Card name={name} price={price} url={url}/>)}
        </ProductsGrid>
    )
}

export default Products
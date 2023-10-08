import {Metadata} from 'next';
import Image from 'next/image';
import React from 'react';
import Counter from '../../../../components/Counter';
import pic from '../../../img/Coffee.png';

interface Product {
    name: string;
    description: string;
    priceDetails: { price: number; currency: string; };
}

async function getItemById(id: string): Promise<Product | null> {
    try {
        const response = await fetch(`http://localhost:8083/api/v1/products/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch product');
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

interface Props {
    params: {
        id: string;
    };
}

export async function generateMetadata({params: {id},}: Props): Promise<Metadata> {
    const item = await getItemById(id);

    if (!item) {
        return {
            title: 'Product Not Found',
        };
    }

    return {
        title: item.name,
    };
}

function ProductImage() {
    return (
        <div>
            <Image src={pic} width={500} height={500} alt="Product Image"/>
        </div>
    );
}

function ProductInfo({item}: { item: Product }) {
    return (
        <div className="px-4 ml-12">
            <h2 className="font-medium text-5xl mb-5">{item.name}</h2>
            <div className="flex items-center mb-10">
                <div className="flex items-center text-base mr-7">
                    <span className="text-[#57b426] mr-1">&#9733;</span>
                    <span className="text-[#57b426]">4.0</span>
                </div>
                <span className="text-black text-base font-medium">Size: 500 g.</span>
            </div>
            <div className="flex items-center gap-2 mb-12">
                <Counter/>
                <button
                    className="flex w-64 px-6 py-4 justify-center items-center gap-3 rounded-full bg-indigo-600 text-white text-lg font-medium">
                    Add to Cart &#8226; {item.priceDetails.price} {item.priceDetails.currency}
                </button>
            </div>
            <p className="w-[532px] mb-4 text-2xl font-medium">
                {item.description}
            </p>
        </div>
    );
}

async function ProductPage({params: {id}}: Props) {
    const item = await getItemById(id);

    if (!item) {
        return <div>Product not found</div>;
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="flex p-4 bg-white">
                <ProductImage/>
                <ProductInfo item={item}/>
            </div>
        </div>
    );
}

export default ProductPage;

import { IProductsList } from '@/models/Products'

export const productsList: IProductsList = {
  products: [
    {
      id: '418499f3-d951-40bf-9414-5cb90ab21ecb',
      name: 'Mocha',
      description: 'Indulgent Chocolate-infused Coffee',
      price: 7.99,
      quantity: 40,
      active: true,
    },
    {
      id: '46f97165-00a7-4b45-9e5c-09f8168b0047',
      name: 'Macchiato',
      description: 'Espresso with a Dash of Frothy Milk',
      price: 3.99,
      quantity: 90,
      active: true,
    },
    {
      id: '1e5b295f-8f50-4425-90e9-8b590a27b3a9',
      name: 'Latte',
      description: 'Creamy Espresso with Steamed Milk',
      price: 5.49,
      quantity: 80,
      active: true,
    },
    {
      id: 'ad0ef2b7-816b-4a11-b361-dfcbe705fc96',
      name: 'Espresso',
      description: 'Strong and Intense Coffee Shot',
      price: 4.99,
      quantity: 120,
      active: true,
    },
    {
      id: 'a3c4d3f7-1172-4fb2-90a9-59b13b35dfc6',
      name: 'Cappuccino',
      description: 'Rich Espresso with Frothy Milk',
      price: 6.29,
      quantity: 60,
      active: true,
    },
    {
      id: 'e6a4d7f2-d40e-4e5f-93b8-5d56ce6724c5',
      name: 'Americano',
      description: 'Espresso Diluted with Hot Water',
      price: 4.49,
      quantity: 70,
      active: true,
    },
  ],
  page: 0,
  size: 50,
  totalElements: 6,
  totalPages: 1,
}

'use client'

import React from 'react'
import CheckOutElement from '@/components/Checkout/CheckoutSammary/CheckoutSammary'
import Button from '@/components/UI/Buttons/Button/Button'
import Link from 'next/link'

export default function CheckoutPage() {
  const items = [
    { id: 1, name: 'Coffee A', weight: '250g', price: 12.99 },
    { id: 2, name: 'Coffee B', weight: '500g', price: 19.99 },
    { id: 3, name: 'Coffee C', weight: '1kg', price: 29.99 },
  ]
  const subtotal = items.reduce((acc, item) => acc + item.price, 0)

  return (
    <div className="mx-6 mt-8 justify-center lg:mx-24 lg:flex">
      <div className="p-4 lg:w-1/2">
        {/* Checkout form */}
        <form>
          <div>
            <h2 className="mb-4 pt-6 text-4xl font-medium text-slate-950">
              Contact
            </h2>
            <div className="flex justify-between">
              <label className=" text-sm font-medium text-gray-600">
                Email
              </label>
              <p>
                Have an account?
                <a href="#" className="ml-3 text-indigo-600 underline">
                  Log in
                </a>
              </p>
            </div>
            <input
              className=" my-4 w-full  rounded-md border bg-gray-100 p-2"
              type="email"
              id="email"
              placeholder="Email"
            />
          </div>

          {/* Delivery */}
          <h2 className="mb-4 pt-6 text-4xl font-medium text-slate-950">
            Delivery
          </h2>

          <div className="flex gap-6">
            <div className="w-1/2">
              <label className=" text-sm font-medium text-gray-600">
                First Name
              </label>

              <input
                className=" my-4 w-full  rounded-md border bg-gray-100 p-2"
                type="text"
                placeholder="First Name"
              />
            </div>

            <div className=" w-1/2 ">
              <label className=" text-sm font-medium text-gray-600">
                Last Name
              </label>

              <input
                className=" my-4 w-full  rounded-md border bg-gray-100 p-2"
                type="text"
                placeholder="Last Name"
              />
            </div>
          </div>
          <label className=" text-sm font-medium text-gray-600">
            Phone number
          </label>

          <input
            className=" my-4 w-full  rounded-md border bg-gray-100 p-2"
            type="phone"
            placeholder="Phone number"
          />
          <label className=" text-sm font-medium text-gray-600">Country</label>
          {/* <CountrySelector onChange={handleCountryChange} /> */}

          <label className=" text-sm font-medium text-gray-600">Address</label>

          <input
            className=" my-4 w-full  rounded-md border bg-gray-100 p-2"
            type="text"
            placeholder="Address"
          />
          <div className="flex gap-6">
            <div className="w-1/2">
              <label className=" text-sm font-medium text-gray-600">City</label>

              <input
                className=" my-4 w-full  rounded-md border bg-gray-100 p-2"
                type="text"
                placeholder="City"
              />
            </div>

            <div className=" w-1/2 ">
              <label className=" text-sm font-medium text-gray-600">
                Zip code
              </label>

              <input
                className=" my-4 w-full  rounded-md border bg-gray-100 p-2"
                type="text"
                placeholder=" Zip code"
              />
            </div>
          </div>
          <label className=" text-lg font-medium text-gray-600">
            Shipping method
          </label>

          <input
            className=" my-4 w-full  rounded-md border bg-gray-100 p-2"
            type="text"
            placeholder="International shipping 6$"
          />
          {/* Payment*/}

          <h2 className="mb-4 pt-6 text-4xl font-medium text-slate-950">
            Payment
          </h2>

          <label className=" text-sm font-medium text-gray-600">
            Card number
          </label>

          <input
            className=" my-4 w-full  rounded-md border bg-gray-100 p-2"
            type="text"
            placeholder=" Card number"
          />
          <div className="flex gap-6">
            <div className="w-1/2">
              <label className=" text-sm font-medium text-gray-600">
                Expiration date
              </label>

              <input
                className=" my-4 w-full  rounded-md border bg-gray-100 p-2"
                type="text"
                placeholder="Expiration date (MM YY)"
              />
            </div>

            <div className=" w-1/2 ">
              <label className=" text-sm font-medium text-gray-600">
                Security code
              </label>

              <input
                className=" my-4 w-full  rounded-md border bg-gray-100 p-2"
                type="text"
                placeholder=" Security code"
              />
            </div>
          </div>

          <label className=" text-sm font-medium text-gray-600">
            Name on the card
          </label>

          <input
            className=" my-4 w-full  rounded-md border bg-gray-100 p-2"
            type="text"
            placeholder=" Name on the card"
          />

          <Button className="h-14 w-full text-lg font-medium">
            <Link href={'/'}>Pay now</Link>
          </Button>
        </form>
      </div>
      <div className="p-4  lg:w-1/2">
        {/* Summary section */}
        <div className="my-2 rounded-md border-2 px-10">
          <div className="mb-4 flex flex-col  ">
            <h2 className=" my-6 text-left text-xl">Summary</h2>
            <div className="border-b-2">
              {items.map((item) => (
                <CheckOutElement
                  key={item.id}
                  itemName={item.name}
                  weight={item.weight}
                  price={item.price}
                  id={item.id}
                />
              ))}
            </div>
            <div className="mt-4 flex justify-between ">
              <p>Subtotal:</p>
              <p className="">${subtotal.toFixed(2)}</p>
            </div>
            <div className="mt-4 flex justify-between ">
              <p>Shipping:</p>
              <p className="">${subtotal.toFixed(2)}</p>
            </div>
            <div className="mb-4 mt-4  flex justify-between border-b-2 ">
              <p className=" mb-7 ">Tax:</p>
              <p className="">${subtotal.toFixed(2)}</p>
            </div>

            <div className="mt-4 flex justify-between text-2xl">
              <p className="  ">Total:</p>
              <p className="">${subtotal.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

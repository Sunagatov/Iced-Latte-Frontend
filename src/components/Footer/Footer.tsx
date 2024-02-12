export default function Footer() {
  return (
    <footer className={`flex h-28 w-full items-center justify-start bg-black text-inverted`}>
      <div className={`sm:text-lg ml-6 text-base sm:ml-36 sm:flex sm:items-center sm:gap-28`}>
        <div className={`flex gap-x-3 sm:order-2 flex-col sm:justify-center mb-3`}>
          <div>
            <a href="tel:(555) 123-45675" rel="noopener noreferrer">
              Phone Number: (555) 123-4567
            </a>
          </div>
          <div>
            Email:
            <span className={`ml-1 underline sm:no-underline`}>
              <a href="mailto:info@coffeetimecafe.com" rel="noopener noreferrer">
                info@coffeetimecafe.com
              </a>
            </span>
          </div>
        </div>
        <div className={`sm:order-1 sm:mb-0 w-52`}>© 2023 Iced Latte</div>
      </div>
    </footer>
  )
}




// export default function Footer() {
//   return (
//     <footer className={`flex h-24 w-full items-center justify-start bg-black text-inverted sm:flex-row`}>
//       <div className={`ml-6 text-lg sm:ml-36 sm:flex sm:items-center sm:gap-28`}>
//         <div className={`flex gap-x-3 sm:order-2 sm:flex-col sm:justify-center`}>
//           <div>
//             <a href="tel:(555) 123-45675" rel="noopener noreferrer">
//               Phone Number: (555) 123-4567
//             </a>
//           </div>
//           <div>
//             Email:
//             <span className={`ml-1 underline sm:no-underline`}>
//               <a href="mailto:info@coffeetimecafe.com" rel="noopener noreferrer">
//                 info@coffeetimecafe.com
//               </a>
//             </span>
//           </div>
//         </div>
//         <div className={`sm:order-1 sm:mb-0 w-52`}>© 2023 Iced Latte</div>
//       </div>
//     </footer>
//   )
// }

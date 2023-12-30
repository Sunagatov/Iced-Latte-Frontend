export default function Footer() {
  return (
    <footer
      className={'flex h-24 w-full items-center justify-start bg-black text-inverted sm:flex-row'}>
      <div
        className={' ml-6 text-lg sm:mx-36 sm:flex sm:items-center sm:gap-36'}
      >
        <ul
          className={
            'flex flex-wrap gap-x-3 sm:order-2 sm:flex-col sm:justify-center'
          }
        >
          <li>
            <a href="tel:(555) 123-45675" rel="noopener noreferrer">
              Phone Number: (555) 123-4567
            </a>
          </li>
          <li>
            Email:
            <span className={'ml-1 underline  sm:no-underline'}>
              <a
                href="mailto:info@coffeetimecafe.com"
                rel="noopener noreferrer"
              >
                info@coffeetimecafe.com
              </a>
            </span>
          </li>
        </ul>
        <p className={'sm:order-1 sm:mb-0'}>© 2023 Iced Latte</p>
      </div>
    </footer>
  )
}

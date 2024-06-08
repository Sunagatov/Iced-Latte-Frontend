export default function Footer() {
  return (
    <footer className="flex h-28 w-full items-center justify-start bg-black text-inverted">
      <div className="ml-6 flex flex-col text-base sm:ml-16 sm:flex-row sm:items-center sm:text-lg md:ml-36 md:gap-14 lg:gap-28">
        <div className="mb-3 flex flex-col gap-x-3 sm:order-2 sm:justify-center">
          <div>
            <a href="tel:(555) 123-45675" rel="noopener noreferrer">
              Phone Number: (555) 123-4567
            </a>
          </div>
          <div>
            Email:
            <span className="ml-1 underline sm:no-underline">
              <a
                target="_blank"
                href="mailto:info@coffeetimecafe.com"
                rel="noopener noreferrer"
              >
                info@coffeetimecafe.com
              </a>
            </span>
          </div>
        </div>
        <div className="flex w-52 sm:order-1 sm:mb-0">© 2024 Iced Latte</div>
      </div>
    </footer>
  )
}

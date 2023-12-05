const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="ml-auto mr-auto max-w-[1440px] pl-[10px] pr-[10px]">
      {children}
    </div>
  )
}

export default Container

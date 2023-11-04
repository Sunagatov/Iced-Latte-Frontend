import Image from 'next/image'
import hero from '../../public/hero.png'

export const Hero = () => {
  return (
    <section className="    sh-screen flex justify-center mx-36 mt-24">
      <div className="dddd"></div>
      <div>
        <div className="sm:rounded-none rounded-2xl w-[572px] h-[200px] sm:w-[1144px] sm:h-[400px]">
          <Image src={hero} width={1144} height={400} alt="Hero" priority />
        </div>
      </div>
    </section>
  )
}

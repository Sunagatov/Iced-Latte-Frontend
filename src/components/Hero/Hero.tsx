import Image from 'next/image'
import hero from '../../../public/hero.png'

export default function Hero() {
  return (
    <section className={'flex justify-center'}>
      <div className={'z-[-1] min-h-[200px] overflow-hidden'}>
        <Image
          src={hero}
          width={1144}
          height={400}
          className={
            'scale-[1.9] min-[450px]:scale-[1.4] min-[572px]:scale-100'
          }
          style={{ objectFit: 'contain' }}
          alt="Hero"
          priority
        />
      </div>
    </section>
  )
}

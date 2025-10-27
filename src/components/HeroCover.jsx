import Spline from '@splinetool/react-spline';
import { Rocket, Star } from 'lucide-react';

export default function HeroCover() {
  return (
    <section className="relative h-[60vh] w-full overflow-hidden rounded-2xl bg-black">
      <div className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/0CT1-dbOQTa-XJKt/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/40 to-black/80 pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <div className="flex items-center gap-3 text-indigo-300">
          <Rocket className="h-6 w-6" />
          <span className="uppercase tracking-widest text-sm">Near-Earth Asteroids</span>
        </div>
        <h1 className="mt-4 text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight">
          Track Asteroids Passing Near Earth
        </h1>
        <p className="mt-4 max-w-2xl text-indigo-100">
          Live feed, rich visuals, and detailed insights from NASA's NeoWs API. Explore sizes, speeds, and close approaches in an immersive space-themed experience.
        </p>
        <div className="mt-6 flex items-center gap-4 text-indigo-200">
          <Star className="h-5 w-5" />
          <span className="text-sm">Data refreshed in real-time windows</span>
        </div>
      </div>
    </section>
  );
}

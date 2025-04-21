import { Camera } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-[family-name:var(--font-geist-sans)]">
      <header className="flex justify-end items-center p-4 sm:p-6">
      </header>

      <main className="flex flex-col flex-grow items-center justify-center text-center p-8 gap-6">
        <div className="flex items-center gap-4">
          <Camera size={48} />
          <h1 className="text-4xl sm:text-5xl font-bold">PhotoBooth</h1>
        </div>
        <p className="text-lg sm:text-xl text-gray-600">
          Capture 3 moments, get 1 instant print.
        </p>
        <Link href="/capture" className="mt-10">
          <button className=" px-6 py-3 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition-colors cursor-pointer">
            Get Started
          </button>
        </Link>
      </main>

      <footer className="flex justify-between items-center p-4 sm:p-6 text-sm text-gray-500">
        <div>
          <span>Vendel ittech  po</span>
        </div>
        <div>
          <span>Made with 🍑💦</span>
        </div>
      </footer>
    </div>
  );
}

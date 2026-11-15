import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'MfaroBooking — Every booking. Perfectly managed.',description:'Your bookings, customers and business, beautifully in sync.',manifest:'/manifest.webmanifest',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}

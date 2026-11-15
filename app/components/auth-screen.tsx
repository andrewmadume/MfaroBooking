import { ArrowRight,CalendarCheck2,ShieldCheck,UsersRound } from 'lucide-react';
import { Brand } from './brand';
import {VercelAuthForm} from './vercel-auth-form';

export function AuthScreen({mode='signin'}:{mode?:'signin'|'register'}) {
  const register=mode==='register';
  return <main className="auth-page">
    <header className="auth-header"><Brand priority/><span>Every booking. Perfectly managed.</span></header>
    <div className="auth-layout">
      <section className="auth-story" aria-labelledby="auth-story-title">
        <span className="eyebrow">YOUR BUSINESS, BEAUTIFULLY IN SYNC</span>
        <h1 id="auth-story-title">More time for people.<br/><span>Less time on admin.</span></h1>
        <p>Bring your bookings, customers and team together in one welcoming workspace.</p>
        <div className="auth-benefits">
          <div><CalendarCheck2 size={21}/><span><b>A clear view of every day</b>Appointments and stays, perfectly organised.</span></div>
          <div><UsersRound size={21}/><span><b>A workspace that fits</b>Built for service businesses across six industries.</span></div>
          <div><ShieldCheck size={21}/><span><b>Your business stays yours</b>Separate workspaces with role-based access.</span></div>
        </div>
      </section>
      <section className="auth-card" aria-labelledby="auth-title">
        <Brand className="auth-card-brand" priority/>
        <nav className="auth-tabs" aria-label="Account access">
          <a href="/signin" aria-current={!register?'page':undefined}>Sign in</a>
          <a href="/register" aria-current={register?'page':undefined}>Create account</a>
        </nav>
        <span className="eyebrow">{register?'YOUR NEXT CHAPTER STARTS HERE':'WELCOME BACK'}</span>
        <h2 id="auth-title">{register?'Let’s get your business ready.':'Good to see you again.'}</h2>
        <p>{register?'Create your MfaroBooking workspace.':'Sign in to manage your bookings and keep your day running smoothly.'}</p>
        {process.env.NEXT_PUBLIC_VERCEL_AUTH==='true'?<VercelAuthForm register={register}/>:<><a className="btn primary auth-continue" href="/signin-with-chatgpt?return_to=%2F" target="_top">
          {register?'Create account with ChatGPT':'Sign in with ChatGPT'}<ArrowRight size={18}/>
        </a>
        <div className="auth-security"><ShieldCheck size={16}/><span>Secure authentication provided by ChatGPT.</span></div>
        <p className="auth-explainer">{register?'Your first sign-in creates your workspace account. You can explore the demo businesses, then set up your own business in Settings.':'Use the same ChatGPT account you used to create your workspace. Your existing bookings and business settings will be waiting for you.'}</p>
        </>}<div className="auth-switch">{register?'Already have an account?':'New to MfaroBooking?'} <a href={register?'/signin':'/register'}>{register?'Sign in':'Create an account'}</a></div>
      </section>
    </div>
    <footer className="auth-footer">MfaroBooking · Every booking. Perfectly managed.</footer>
  </main>;
}

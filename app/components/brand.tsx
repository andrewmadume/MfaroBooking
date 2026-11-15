/** The supplied brand artwork is served unchanged, with its original proportions. */
export function Brand({className='',priority=false}:{className?:string;priority?:boolean}) {
  return <a className={`brand brand-image ${className}`} href="/" aria-label="MfaroBooking home">
    <img src="/brand/mfarobooking-logo.png" alt="MfaroBooking" width={1771} height={887} fetchPriority={priority?'high':'auto'} decoding="async"/>
  </a>;
}

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const protectroute = createRouteMatcher(['/','/upcoming','/previous','/recordings','personal-room', '/meeting(.*)'])
 
export default clerkMiddleware((auth , req)=>{
  if(protectroute(req)) auth().protect();
});
 
export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
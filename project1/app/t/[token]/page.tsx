import { redirect } from "next/navigation";

export default async function TokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  
  // Redirect to test page with token as query parameter
  redirect(`/test?token=${encodeURIComponent(token)}`);
}

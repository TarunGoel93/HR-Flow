import { redirect } from "next/navigation";

export default function TokenPage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;

  redirect(`/test?token=${encodeURIComponent(token)}`);
}






// import { redirect } from "next/navigation";

// export default async function TokenPage({ params }: { params: Promise<{ token: string }> }) {
//   const { token } = await params;
  
//   // Redirect to test page with token as query parameter
//   redirect(`/test?token=${encodeURIComponent(token)}`);
// }








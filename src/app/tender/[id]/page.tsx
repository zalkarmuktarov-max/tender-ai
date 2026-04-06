import { TenderForm } from './TenderForm';

export default async function TenderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TenderForm tenderId={id} />;
}

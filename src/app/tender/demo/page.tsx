import { TenderForm } from '../[id]/TenderForm';
import { mockFormFields } from '@/data/mockTenderData';

export default function DemoPage() {
  return <TenderForm tenderId="demo" fields={mockFormFields} />;
}

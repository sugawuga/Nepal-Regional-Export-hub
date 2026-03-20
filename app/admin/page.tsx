import { connectDB, Region as RegionModel } from '@/lib/db';
import AdminDashboard from '@/components/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await connectDB();
  const regions = await RegionModel.find().lean();

  return <AdminDashboard initialRegions={JSON.parse(JSON.stringify(regions))} />;
}

import { DashboardHeader } from '@/components/dashboard-header';
import { TiktokDashboard } from '@/components/tiktok-dashboard';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center">
      <div className="w-full max-w-7xl p-4 md:p-8">
        <DashboardHeader />
        <TiktokDashboard />
      </div>
    </main>
  );
}

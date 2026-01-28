import { OnboardingBanner } from '@/components/dashboard/OnboardingBanner';

export default function DashboardRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col">
            <OnboardingBanner />
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}

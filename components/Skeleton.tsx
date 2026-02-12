
import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
    return (
        <div className={`animate-pulse bg-slate-800/50 rounded-lg ${className}`}></div>
    );
};

export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-32 rounded-3xl" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <Skeleton className="lg:col-span-2 h-[400px] rounded-[2rem]" />
                <Skeleton className="h-[400px] rounded-[2rem]" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <Skeleton className="h-[300px] rounded-[2rem]" />
                <Skeleton className="h-[300px] rounded-[2rem]" />
            </div>
        </div>
    );
}

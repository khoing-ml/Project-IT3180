import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down";
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
}

export default function StatsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconBgColor,
  iconColor,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          <div className="flex items-center gap-1 mt-3">
            <svg
              className={`w-4 h-4 ${
                changeType === "up" ? "text-green-500" : "text-red-500"
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              {changeType === "up" ? (
                <path
                  fillRule="evenodd"
                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              )}
            </svg>
            <span
              className={`text-sm font-medium ${
                changeType === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              {change}
            </span>
          </div>
        </div>
        <div className={`${iconBgColor} rounded-full p-3`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

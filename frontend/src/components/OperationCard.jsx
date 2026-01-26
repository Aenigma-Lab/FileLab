import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const OperationCard = ({
  icon: Icon,
  title,
  description,
  color = "blue",
  onClick,
  isSelected,
  isSubOperation = false,
}) => {
  // iLovePDF-style color mappings
  const colorClasses = {
    blue: {
      iconBg: "bg-blue-500",
      iconText: "text-white",
      border: "border-blue-200 hover:border-blue-300",
      selected: "ring-2 ring-blue-500 bg-blue-50",
    },
    purple: {
      iconBg: "bg-purple-500",
      iconText: "text-white",
      border: "border-purple-200 hover:border-purple-300",
      selected: "ring-2 ring-purple-500 bg-purple-50",
    },
    green: {
      iconBg: "bg-green-500",
      iconText: "text-white",
      border: "border-green-200 hover:border-green-300",
      selected: "ring-2 ring-green-500 bg-green-50",
    },
    orange: {
      iconBg: "bg-orange-500",
      iconText: "text-white",
      border: "border-orange-200 hover:border-orange-300",
      selected: "ring-2 ring-orange-500 bg-orange-50",
    },
    red: {
      iconBg: "bg-red-500",
      iconText: "text-white",
      border: "border-red-200 hover:border-red-300",
      selected: "ring-2 ring-red-500 bg-red-50",
    },
    teal: {
      iconBg: "bg-teal-500",
      iconText: "text-white",
      border: "border-teal-200 hover:border-teal-300",
      selected: "ring-2 ring-teal-500 bg-teal-50",
    },
    cyan: {
      iconBg: "bg-cyan-500",
      iconText: "text-white",
      border: "border-cyan-200 hover:border-cyan-300",
      selected: "ring-2 ring-cyan-500 bg-cyan-50",
    },
    violet: {
      iconBg: "bg-violet-500",
      iconText: "text-white",
      border: "border-violet-200 hover:border-violet-300",
      selected: "ring-2 ring-violet-500 bg-violet-50",
    },
    amber: {
      iconBg: "bg-amber-500",
      iconText: "text-white",
      border: "border-amber-200 hover:border-amber-300",
      selected: "ring-2 ring-amber-500 bg-amber-50",
    },
    rose: {
      iconBg: "bg-rose-500",
      iconText: "text-white",
      border: "border-rose-200 hover:border-rose-300",
      selected: "ring-2 ring-rose-500 bg-rose-50",
    },
    indigo: {
      iconBg: "bg-indigo-500",
      iconText: "text-white",
      border: "border-indigo-200 hover:border-indigo-300",
      selected: "ring-2 ring-indigo-500 bg-indigo-50",
    },
    pink: {
      iconBg: "bg-pink-500",
      iconText: "text-white",
      border: "border-pink-200 hover:border-pink-300",
      selected: "ring-2 ring-pink-500 bg-pink-50",
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <Card
      className={cn(
        "transition-all duration-200 cursor-pointer select-none h-full",
        isSelected && colors.selected,
        !isSelected && "hover:shadow-lg hover:-translate-y-1",
        "border-2",
        colors.border
      )}
      onClick={onClick}
    >
      <CardContent className={cn(
        "p-4 md:p-5 h-full flex flex-col",
        isSubOperation && "p-4 md:p-5 flex-row items-center gap-3 md:gap-4"
      )}>
        {isSubOperation ? (
          // Sub-operation: Mobile-friendly size
          <>
            <div
              className={cn(
                "w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0",
                colors.iconBg,
                colors.iconText,
                "shadow"
              )}
            >
              <Icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="font-semibold text-sm md:text-lg text-gray-800 break-words">
              {title}
            </span>
          </>
        ) : (
          // Main category: Mobile-friendly size
          <div className="flex items-center gap-3 md:gap-4">
            <div
              className={cn(
                "w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0",
                colors.iconBg,
                colors.iconText,
                "shadow"
              )}
            >
              <Icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm md:text-lg text-gray-900">
                {title}
              </h3>
              {description && (
                <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1 line-clamp-1">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OperationCard;


"use client";

interface StravaEmbedProps {
     activityId: string;
     style?: "standard" | "minimal";
     className?: string;
}

export default function StravaEmbed({ activityId, style = "standard", className = "" }: StravaEmbedProps) {
     return (
          <div
               className={`strava-embed-placeholder ${className}`}
               data-embed-type="activity"
               data-embed-id={activityId}
               data-style={style}
               data-from-embed="false"
          />
     );
}

interface StravaEmbedContainerProps {
     activities: Array<{
          id: string;
          title?: string;
          style?: "standard" | "minimal";
     }>;
     description?: string;
     showDebugInfo?: boolean;
}

export function StravaEmbedContainer({ activities, description, showDebugInfo = false }: StravaEmbedContainerProps) {
     return (
          <div className="space-y-6">
               {description && (
                    <div className="font-lora text-lg leading-relaxed text-center max-w-4xl mx-auto mb-8">
                         {description}
                    </div>
               )}
               {showDebugInfo && (
                    <div className="text-sm text-gray-500 mb-4">
                         Debug: {activities.length} Strava activities loaded
                    </div>
               )}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activities.map((activity) => (
                         <div key={activity.id} className="strava-activity-container">
                              {activity.title && (
                                   <h4 className="text-lg font-semibold mb-2 text-center">{activity.title}</h4>
                              )}
                              <StravaEmbed activityId={activity.id} style={activity.style || "standard"} />
                         </div>
                    ))}
               </div>
          </div>
     );
}

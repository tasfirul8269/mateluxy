import React from "react";
import { Button } from "@/components/AdminPannel/ui/button";
import { customToast, toast } from "@/components/AdminPannel/ui/sonner";

export function ToastDemo() {
  return (
    <div className="grid gap-4 p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Toast Notifications</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium mb-3">Basic Toasts</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() =>
                customToast.success("Agent updated successfully!", {
                  description: "The changes have been saved to the database.",
                })
              }
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              Success
            </Button>
            
            <Button
              onClick={() =>
                customToast.error("Failed to update agent", {
                  description: "There was a problem connecting to the server.",
                })
              }
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
            >
              Error
            </Button>
            
            <Button
              onClick={() =>
                customToast.warning("Some fields are empty", {
                  description: "You might want to fill in all required fields.",
                })
              }
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
            >
              Warning
            </Button>
            
            <Button
              onClick={() =>
                customToast.info("New update available", {
                  description: "The application has a new version available for download.",
                })
              }
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              Info
            </Button>
          </div>
          
          <h3 className="text-lg font-medium mt-6 mb-3">With Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() =>
                customToast.success("Agent deleted", {
                  description: "The agent has been removed from the system.",
                  action: {
                    label: "Undo",
                    onClick: () => customToast.info("Action canceled"),
                  },
                })
              }
              variant="outline"
              className="border-green-200 text-green-600 hover:bg-green-50"
            >
              With Undo
            </Button>
            
            <Button
              onClick={() =>
                customToast.error("Session expired", {
                  description: "Your session has expired due to inactivity.",
                  action: {
                    label: "Login",
                    onClick: () => customToast.info("Redirecting to login..."),
                  },
                })
              }
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              With Action
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium mb-3">Duration & Positioning</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() =>
                customToast.success("Longer duration toast", {
                  duration: 8000,
                  description: "This toast will stay visible for 8 seconds.",
                })
              }
              variant="outline"
              className="border-slate-200 hover:bg-slate-50"
            >
              Long Duration
            </Button>
            
            <Button
              onClick={() => {
                toast.dismiss();
                customToast.info("This toast will persist", {
                  duration: Infinity,
                  description: "Click the X to dismiss this message.",
                });
              }}
              variant="outline"
              className="border-slate-200 hover:bg-slate-50"
            >
              Persistent
            </Button>
            
            <Button
              onClick={() => {
                toast.dismiss();
                customToast.info("Custom position", {
                  position: "top-center",
                  description: "This toast appears at the top center.",
                });
              }}
              variant="outline"
              className="border-slate-200 hover:bg-slate-50"
            >
              Top Position
            </Button>
          </div>
          
          <h3 className="text-lg font-medium mt-6 mb-3">Custom Examples</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() =>
                customToast.success("Agent profile updated", {
                  id: "unique-toast",
                  description: "Contact information and social links have been updated.",
                })
              }
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
            >
              Profile Updated
            </Button>
            
            <Button
              onClick={() =>
                customToast.info("New message received", {
                  description: "You have a new message from John Doe.",
                  action: {
                    label: "View",
                    onClick: () => customToast.success("Opening messages..."),
                  },
                })
              }
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
            >
              New Message
            </Button>
            
            <Button
              onClick={() => {
                toast.dismiss();
                toast.custom((t) => (
                  <div
                    className={`${
                      t.visible ? 'animate-in fade-in-50' : 'animate-out fade-out-50'
                    } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                  >
                    <div className="flex-1 p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 pt-0.5">
                          <img
                            className="h-10 w-10 rounded-full"
                            src="https://ui-avatars.com/api/?name=John+Doe&background=random"
                            alt="Profile"
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">John Doe</p>
                          <p className="mt-1 text-sm text-gray-500">Has approved your request</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ));
              }}
              className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
            >
              Custom Toast
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 
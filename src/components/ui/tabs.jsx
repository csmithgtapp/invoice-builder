import * as React from "react"

const Tabs = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col ${className || ''}`}
    {...props}
  />
))
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex px-3 pt-3 border-b border-gray-200 ${className || ''}`}
    {...props}
  />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, isActive, ...props }, ref) => (
  <button
    ref={ref}
    className={`px-2.5 py-1.5 text-xs font-medium rounded-md ${
      isActive 
        ? "text-gray-900 border-b-2 border-blue-500" 
        : "text-gray-500 hover:text-gray-700"
    } ${className || ''}`}
    {...props}
  />
))
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`p-3 flex-1 overflow-y-auto ${className || ''}`}
    {...props}
  />
))
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
import * as React from "react"

const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  asChild = false, 
  ...props 
}, ref) => {
  const Comp = asChild ? React.Slot : "button"
  
  const getVariantStyles = () => {
    switch (variant) {
      case "default":
        return "bg-blue-600 text-white hover:bg-blue-700"
      case "destructive":
        return "bg-red-500 text-white hover:bg-red-600"
      case "outline":
        return "border border-gray-300 bg-white hover:bg-gray-100 text-gray-900"
      case "secondary":
        return "bg-gray-100 text-gray-900 hover:bg-gray-200"
      case "ghost":
        return "hover:bg-gray-100 text-gray-900"
      case "link":
        return "text-blue-600 underline-offset-4 hover:underline"
      case "success":
        return "bg-green-50 text-green-600 hover:bg-green-100"
      case "info":
        return "bg-blue-50 text-blue-600 hover:bg-blue-100"
      default:
        return "bg-blue-600 text-white hover:bg-blue-700"
    }
  }
  
  const getSizeStyles = () => {
    switch (size) {
      case "default":
        return "h-9 px-4 py-2"
      case "sm":
        return "h-8 px-3 text-xs"
      case "lg":
        return "h-10 px-8"
      case "icon":
        return "h-9 w-9"
      default:
        return "h-9 px-4 py-2"
    }
  }
  
  return (
    <Comp
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium
        transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400
        disabled:pointer-events-none disabled:opacity-50
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${className || ''}
      `}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
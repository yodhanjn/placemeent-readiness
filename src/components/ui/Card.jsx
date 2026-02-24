import { forwardRef } from 'react'

const Card = forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm overflow-hidden ${className}`}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = ({ className = '', ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-4 md:p-6 ${className}`} {...props} />
)

const CardTitle = ({ className = '', ...props }) => (
  <h3 className={`text-base md:text-lg font-semibold leading-none tracking-tight ${className}`} {...props} />
)

const CardDescription = ({ className = '', ...props }) => (
  <p className={`text-xs md:text-sm text-gray-500 ${className}`} {...props} />
)

const CardContent = ({ className = '', ...props }) => (
  <div className={`p-4 md:p-6 pt-0 ${className}`} {...props} />
)

const CardFooter = ({ className = '', ...props }) => (
  <div className={`flex items-center p-4 md:p-6 pt-0 ${className}`} {...props} />
)

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

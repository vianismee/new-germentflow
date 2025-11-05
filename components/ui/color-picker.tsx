"use client"

import * as React from "react"
import { ColorPicker as ColorPickerPrimitive, parseColor } from "@ark-ui/react/color-picker"
import { Portal } from "@ark-ui/react/portal"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ColorPickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

const PRESET_COLORS = [
  "#EF4444", // Red
  "#F97316", // Orange
  "#F59E0B", // Amber
  "#EAB308", // Yellow
  "#84CC16", // Lime
  "#22C55E", // Green
  "#10B981", // Emerald
  "#14B8A6", // Teal
  "#06B6D4", // Cyan
  "#0EA5E9", // Sky
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#A855F7", // Purple
  "#D946EF", // Fuchsia
  "#EC4899", // Pink
  "#F43F5E", // Rose
  "#000000", // Black
  "#6B7280", // Gray
  "#FFFFFF", // White
]

export function ColorPicker({
  value = "#3B82F6",
  onChange,
  placeholder = "Select a color",
  className,
  disabled = false,
}: ColorPickerProps) {
  // Ensure value is always a valid color object
  const getValidColor = (colorValue: any) => {
    if (typeof colorValue === 'string' && colorValue.trim() !== '') {
      try {
        return parseColor(colorValue)
      } catch {
        return parseColor("#3B82F6")
      }
    }
    return parseColor("#3B82F6")
  }

  const [color, setColor] = React.useState(() => getValidColor(value))

  React.useEffect(() => {
    setColor(getValidColor(value))
  }, [value])

  const handleColorChange = (details: any) => {
    setColor(details.value)
    try {
      const hexValue = details.value.toString("hex")
      onChange?.(hexValue)
    } catch {
      onChange?.("#3B82F6")
    }
  }

  const handlePresetColorClick = (presetColor: string) => {
    const newColor = parseColor(presetColor)
    setColor(newColor)
    onChange?.(presetColor)
  }

  return (
    <div className={cn("w-full", className)}>
      <ColorPickerPrimitive.Root
        value={color}
        onValueChange={handleColorChange}
        disabled={disabled}
      >
        <div className="space-y-4">
          {/* Full color preview */}
          <ColorPickerPrimitive.Trigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full h-16 rounded-md border-2 overflow-hidden cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
              disabled={disabled}
            >
              <ColorPickerPrimitive.ValueSwatch className="w-full h-full" />
            </Button>
          </ColorPickerPrimitive.Trigger>

          {/* Hidden input for value */}
          <ColorPickerPrimitive.Control className="hidden">
            <ColorPickerPrimitive.ChannelInput
              channel="hex"
              placeholder={placeholder}
              disabled={disabled}
            />
          </ColorPickerPrimitive.Control>

          {/* Color Picker Content */}
          <Portal>
            <ColorPickerPrimitive.Positioner>
              <ColorPickerPrimitive.Content className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg space-y-4 z-50 w-80">
                {/* Color Area */}
                <ColorPickerPrimitive.Area className="w-full h-36 rounded-md overflow-hidden relative">
                  <ColorPickerPrimitive.AreaBackground className="w-full h-full" />
                  <ColorPickerPrimitive.AreaThumb className="absolute w-3 h-3 bg-white border-2 border-black rounded-full shadow-xs -translate-x-1/2 -translate-y-1/2" />
                </ColorPickerPrimitive.Area>

                {/* Eye Dropper and Sliders */}
                <div className="flex items-center gap-3">
                  <ColorPickerPrimitive.EyeDropperTrigger className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </ColorPickerPrimitive.EyeDropperTrigger>

                  <div className="flex-1 space-y-2">
                    {/* Hue Slider */}
                    <ColorPickerPrimitive.ChannelSlider
                      channel="hue"
                      className="relative w-full h-3 rounded-full overflow-hidden"
                    >
                      <ColorPickerPrimitive.ChannelSliderTrack
                        className="w-full h-full"
                        style={{
                          background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                        }}
                      />
                      <ColorPickerPrimitive.ChannelSliderThumb className="absolute top-1/2 w-3 h-3 bg-white border-2 border-black rounded-full shadow-xs -translate-y-1/2 -translate-x-1/2" />
                    </ColorPickerPrimitive.ChannelSlider>

                    {/* Alpha Slider */}
                    <ColorPickerPrimitive.ChannelSlider
                      channel="alpha"
                      className="relative w-full h-3 rounded-full overflow-hidden"
                    >
                      <ColorPickerPrimitive.TransparencyGrid
                        className="w-full h-full"
                        style={{
                          backgroundImage: 'conic-gradient(#808080 0deg 90deg, #ffffff 90deg 180deg, #808080 180deg 270deg, #ffffff 270deg)',
                          backgroundSize: '8px 8px'
                        }}
                      />
                      <ColorPickerPrimitive.ChannelSliderTrack className="w-full h-full" />
                      <ColorPickerPrimitive.ChannelSliderThumb className="absolute top-1/2 w-3 h-3 bg-white border-2 border-black rounded-full shadow-xs -translate-y-1/2 -translate-x-1/2" />
                    </ColorPickerPrimitive.ChannelSlider>
                  </div>
                </div>

                {/* Preset Colors */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Preset Colors</h4>
                  <div className="grid grid-cols-10 gap-1">
                    {PRESET_COLORS.map((presetColor) => (
                      <button
                        key={presetColor}
                        type="button"
                        className={cn(
                          "w-7 h-7 rounded-md border-2 hover:scale-110 transition-transform",
                          color.toString("hex").toUpperCase() === presetColor.toUpperCase()
                            ? "border-primary ring-2 ring-primary ring-offset-2"
                            : "border-border"
                        )}
                        style={{ backgroundColor: presetColor }}
                        onClick={() => handlePresetColorClick(presetColor)}
                      />
                    ))}
                  </div>
                </div>

                {/* Input Fields */}
                <div className="flex gap-2">
                  <ColorPickerPrimitive.ChannelInput
                    channel="hex"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <ColorPickerPrimitive.ChannelInput
                    channel="alpha"
                    className="w-16 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </ColorPickerPrimitive.Content>
            </ColorPickerPrimitive.Positioner>
          </Portal>
        </div>
        <ColorPickerPrimitive.HiddenInput />
      </ColorPickerPrimitive.Root>
    </div>
  )
}
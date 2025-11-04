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
  value = "#3B82F6", // Default blue color
  onChange,
  placeholder = "Select a color",
  className,
  disabled = false,
}: ColorPickerProps) {
  // Ensure value is always a valid string color
  const getValidColor = (colorValue: any) => {
    if (typeof colorValue === 'string' && colorValue.trim() !== '') {
      try {
        parseColor(colorValue)
        return colorValue
      } catch (error) {
        return "#3B82F6"
      }
    }
    return "#3B82F6"
  }

  const safeValue = getValidColor(value)
  const [color, setColor] = React.useState(parseColor(safeValue))

  React.useEffect(() => {
    const validColor = getValidColor(value)
    setColor(parseColor(validColor))
  }, [value])

  const handleColorChange = (newColor: any) => {
    setColor(newColor)
    onChange?.(newColor.toString("hex"))
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
        <div className="flex items-center gap-2">
          <ColorPickerPrimitive.Control className="flex-1">
            <input
              type="text"
              value={color.toString("hex")}
              onChange={(e) => handleColorChange(parseColor(e.target.value))}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "w-full px-3 py-2 text-sm border border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                disabled && "cursor-not-allowed opacity-50"
              )}
            />
          </ColorPickerPrimitive.Control>
          <ColorPickerPrimitive.Trigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-10 h-10 p-0 border-2"
              disabled={disabled}
            >
              <div className="w-full h-full relative overflow-hidden rounded-sm">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: 'conic-gradient(#808080 0deg 90deg, #ffffff 90deg 180deg, #808080 180deg 270deg, #ffffff 270deg)',
                    backgroundSize: '8px 8px'
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: color.toString("hex") }}
                />
              </div>
            </Button>
          </ColorPickerPrimitive.Trigger>
        </div>

        <Portal>
          <ColorPickerPrimitive.Positioner>
            <ColorPickerPrimitive.Content className="z-50 w-80 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
              <div className="space-y-4">
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

                {/* Color Area */}
                <ColorPickerPrimitive.Area className="relative w-full h-36 rounded-md overflow-hidden">
                  <ColorPickerPrimitive.AreaBackground className="w-full h-full" />
                  <ColorPickerPrimitive.AreaThumb className="absolute w-4 h-4 bg-white border-2 border-black rounded-full shadow-sm -translate-x-1/2 -translate-y-1/2" />
                </ColorPickerPrimitive.Area>

                {/* Hue and Alpha Sliders */}
                <div className="space-y-2">
                  {/* Hue Slider */}
                  <ColorPickerPrimitive.ChannelSlider
                    channel="hue"
                    className="relative w-full h-3 rounded-full overflow-hidden"
                  >
                    <ColorPickerPrimitive.ChannelSliderTrack
                      className="w-full h-full rounded-full"
                      style={{
                        background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                      }}
                    />
                    <ColorPickerPrimitive.ChannelSliderThumb className="absolute w-4 h-4 bg-white border-2 border-black rounded-full shadow-sm -translate-y-1/2 -translate-x-1/2" />
                  </ColorPickerPrimitive.ChannelSlider>

                  {/* Alpha Slider */}
                  <ColorPickerPrimitive.ChannelSlider
                    channel="alpha"
                    className="relative w-full h-3 rounded-full overflow-hidden"
                  >
                    <div className="absolute inset-0 rounded-full"
                      style={{
                        backgroundImage: 'conic-gradient(#808080 0deg 90deg, #ffffff 90deg 180deg, #808080 180deg 270deg, #ffffff 270deg)',
                        backgroundSize: '8px 8px'
                      }}
                    />
                    <ColorPickerPrimitive.ChannelSliderTrack
                      className="w-full h-full rounded-full"
                      style={{ backgroundColor: color.toString("hex") }}
                    />
                    <ColorPickerPrimitive.ChannelSliderThumb className="absolute w-4 h-4 bg-white border-2 border-black rounded-full shadow-sm -translate-y-1/2 -translate-x-1/2" />
                  </ColorPickerPrimitive.ChannelSlider>
                </div>

                {/* Input Fields */}
                <div className="flex gap-2">
                  <ColorPickerPrimitive.ChannelInput
                    channel="hex"
                    className="flex-1 px-3 py-2 text-sm border border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <ColorPickerPrimitive.ChannelInput
                    channel="alpha"
                    className="w-16 px-3 py-2 text-sm border border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>
            </ColorPickerPrimitive.Content>
          </ColorPickerPrimitive.Positioner>
        </Portal>
        <ColorPickerPrimitive.HiddenInput />
      </ColorPickerPrimitive.Root>
    </div>
  )
}
export function Field({
  label,
  name,
  type = "text",
  required = true,
  maxLength,
  defaultValue,
  error,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  maxLength?: number
  defaultValue?: string
  error?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-neutral-300">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        maxLength={maxLength}
        defaultValue={defaultValue}
        className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
      />
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  )
}

export function SelectField({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string
  name: string
  options: readonly { value: string; label: string }[]
  defaultValue?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-neutral-300">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

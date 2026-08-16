export function Field({
  label,
  name,
  type = "text",
  required = true,
  maxLength,
  error,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  maxLength?: number
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
}: {
  label: string
  name: string
  options: readonly { value: string; label: string }[]
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-neutral-300">
        {label}
      </label>
      <select
        id={name}
        name={name}
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

import { useTranslation } from "react-i18next";
import { useAIConfigOptions } from "#/hooks/query/use-ai-config-options";
import { useSaveSettings } from "#/hooks/mutation/use-save-settings";
import { useSettings } from "#/hooks/query/use-settings";
import { organizeModelsAndProviders } from "#/utils/organize-models-and-providers";
import { I18nKey } from "#/i18n/declaration";

const LITELLM_PROVIDER_ID = "litellm_proxy";

export function QuickModelSwitcher() {
  const { t } = useTranslation();
  const { data: resources } = useAIConfigOptions();
  const { data: settings } = useSettings();
  const { mutate: saveSettings, isPending } = useSaveSettings();

  const modelsByProvider = organizeModelsAndProviders(resources?.models ?? []);
  const litellmModels = modelsByProvider[LITELLM_PROVIDER_ID]?.models ?? [];

  if (!litellmModels.length) {
    return null;
  }

  const currentModel = settings?.llm_model ?? "";
  const modelPrefix = `${LITELLM_PROVIDER_ID}/`;
  const selectedModel = currentModel.startsWith(modelPrefix)
    ? currentModel.slice(modelPrefix.length)
    : "";

  const handleChange = (value: string) => {
    if (!value) {
      return;
    }

    const nextModel = `${LITELLM_PROVIDER_ID}/${value}`;
    if (nextModel === currentModel) {
      return;
    }

    saveSettings({
      llm_model: nextModel,
    });
  };

  return (
    <div className="flex items-center gap-2 border border-[#4B505F] rounded-[100px] px-2 py-1">
      <span className="text-sm text-[#959CB2] leading-5">
        {t(I18nKey.LLM$MODEL)}
      </span>
      <select
        aria-label={t(I18nKey.LLM$MODEL)}
        className="bg-transparent text-white text-sm leading-5 outline-none cursor-pointer max-w-[220px]"
        disabled={isPending}
        value={selectedModel}
        onChange={(event) => handleChange(event.target.value)}
      >
        <option value="" disabled>
          {t(I18nKey.LLM$SELECT_MODEL_PLACEHOLDER)}
        </option>
        {litellmModels.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
    </div>
  );
}

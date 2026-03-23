import {
  Autocomplete,
  AutocompleteItem,
  AutocompleteSection,
} from "@heroui/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { mapProvider } from "#/utils/map-provider";
import {
  VERIFIED_MODELS,
  VERIFIED_PROVIDERS,
  VERIFIED_OPENHANDS_MODELS,
} from "#/utils/verified-models";
import { extractModelAndProvider } from "#/utils/extract-model-and-provider";
import { cn } from "#/utils/utils";
import { HelpLink } from "#/ui/help-link";
import { PRODUCT_URL } from "#/utils/constants";

const LITELLM_PROVIDER_ID = "litellm_proxy";

interface ModelSelectorProps {
  isDisabled?: boolean;
  models: Record<string, { separator: string; models: string[] }>;
  currentModel?: string;
  onChange?: (provider: string | null, model: string | null) => void;
  onDefaultValuesChanged?: (
    provider: string | null,
    model: string | null,
  ) => void;
  wrapperClassName?: string;
  labelClassName?: string;
}

export function ModelSelector({
  isDisabled,
  models,
  currentModel,
  onChange,
  onDefaultValuesChanged,
  wrapperClassName,
  labelClassName,
}: ModelSelectorProps) {
  const [, setLitellmId] = React.useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = React.useState<string | null>(
    null,
  );
  const [selectedModel, setSelectedModel] = React.useState<string | null>(null);

  // Get the appropriate verified models array based on the selected provider
  const getVerifiedModels = () => {
    if (selectedProvider === "openhands") {
      return VERIFIED_OPENHANDS_MODELS;
    }
    return VERIFIED_MODELS;
  };

  React.useEffect(() => {
    if (currentModel) {
      // runs when resetting to defaults
      const { provider, model } = extractModelAndProvider(currentModel);

      setLitellmId(currentModel);
      setSelectedProvider(provider);
      setSelectedModel(model);
      onDefaultValuesChanged?.(provider, model);
    }
  }, [currentModel]);

  const handleChangeProvider = (provider: string) => {
    setSelectedProvider(provider);
    setSelectedModel(null);

    const separator = models[provider]?.separator || "";
    setLitellmId(provider + separator);
    onChange?.(provider, null);
  };

  const handleChangeModel = (model: string) => {
    const separator = models[selectedProvider || ""]?.separator || "";
    let fullModel = selectedProvider + separator + model;
    if (selectedProvider === "openai") {
      // LiteLLM lists OpenAI models without the openai/ prefix
      fullModel = model;
    }
    setLitellmId(fullModel);
    setSelectedModel(model);
    onChange?.(selectedProvider, model);
  };

  const clear = () => {
    setSelectedProvider(null);
    setLitellmId(null);
  };

  const { t } = useTranslation();
  const providers = Object.keys(models);
  const hasLiteLLMProvider = providers.includes(LITELLM_PROVIDER_ID);
  const verifiedProviders = VERIFIED_PROVIDERS.filter(
    (provider) => models[provider],
  );
  const otherProviders = providers.filter(
    (provider) =>
      !VERIFIED_PROVIDERS.includes(provider) &&
      provider !== LITELLM_PROVIDER_ID,
  );
  const selectedProviderModels = models[selectedProvider || ""]?.models ?? [];
  const verifiedModels = getVerifiedModels().filter((model) =>
    selectedProviderModels.includes(model),
  );
  const otherModels = selectedProviderModels.filter(
    (model) => !getVerifiedModels().includes(model),
  );

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row w-[full] max-w-[680px] justify-between gap-4 md:gap-[46px]",
        wrapperClassName,
      )}
    >
      <fieldset className="flex flex-col gap-2.5 w-full">
        <label className={cn("text-sm", labelClassName)}>
          {t(I18nKey.LLM$PROVIDER)}
        </label>
        <Autocomplete
          data-testid="llm-provider-input"
          isRequired
          isVirtualized={false}
          name="llm-provider-input"
          isDisabled={isDisabled}
          aria-label={t(I18nKey.LLM$PROVIDER)}
          placeholder={t(I18nKey.LLM$SELECT_PROVIDER_PLACEHOLDER)}
          isClearable={false}
          onSelectionChange={(e) => {
            if (e?.toString()) handleChangeProvider(e.toString());
          }}
          onInputChange={(value) => !value && clear()}
          defaultSelectedKey={selectedProvider ?? undefined}
          selectedKey={selectedProvider}
          classNames={{
            popoverContent: "bg-tertiary rounded-xl border border-[#717888]",
          }}
          inputProps={{
            classNames: {
              inputWrapper:
                "bg-tertiary border border-[#717888] h-10 w-full rounded-sm p-2 placeholder:italic",
            },
          }}
        >
          <AutocompleteSection title={t(I18nKey.MODEL_SELECTOR$VERIFIED)}>
            {verifiedProviders.map((provider) => (
              <AutocompleteItem
                data-testid={`provider-item-${provider}`}
                key={provider}
              >
                {mapProvider(provider)}
              </AutocompleteItem>
            ))}
          </AutocompleteSection>
          {hasLiteLLMProvider ? (
            <AutocompleteSection title="LiteLLM">
              <AutocompleteItem
                data-testid={`provider-item-${LITELLM_PROVIDER_ID}`}
                key={LITELLM_PROVIDER_ID}
              >
                {mapProvider(LITELLM_PROVIDER_ID)}
              </AutocompleteItem>
            </AutocompleteSection>
          ) : null}
          {otherProviders.length ? (
            <AutocompleteSection title={t(I18nKey.MODEL_SELECTOR$OTHERS)}>
              {otherProviders.map((provider) => (
                <AutocompleteItem key={provider}>
                  {mapProvider(provider)}
                </AutocompleteItem>
              ))}
            </AutocompleteSection>
          ) : null}
        </Autocomplete>
      </fieldset>

      {selectedProvider === "openhands" && (
        <HelpLink
          testId="openhands-account-help"
          text={t(I18nKey.SETTINGS$NEED_OPENHANDS_ACCOUNT)}
          linkText={t(I18nKey.SETTINGS$CLICK_HERE)}
          href={PRODUCT_URL.PRODUCTION}
          size="settings"
          linkColor="white"
        />
      )}

      <fieldset className="flex flex-col gap-2.5 w-full">
        <label className={cn("text-sm", labelClassName)}>
          {t(I18nKey.LLM$MODEL)}
        </label>
        <Autocomplete
          data-testid="llm-model-input"
          isRequired
          isVirtualized={false}
          name="llm-model-input"
          aria-label={t(I18nKey.LLM$MODEL)}
          placeholder={t(I18nKey.LLM$SELECT_MODEL_PLACEHOLDER)}
          isClearable={false}
          onSelectionChange={(e) => {
            if (e?.toString()) handleChangeModel(e.toString());
          }}
          isDisabled={isDisabled || !selectedProvider}
          selectedKey={selectedModel}
          defaultSelectedKey={selectedModel ?? undefined}
          classNames={{
            popoverContent: "bg-tertiary rounded-xl border border-[#717888]",
          }}
          inputProps={{
            classNames: {
              inputWrapper:
                "bg-tertiary border border-[#717888] h-10 w-full rounded-sm p-2 placeholder:italic",
            },
          }}
        >
          {selectedProvider === LITELLM_PROVIDER_ID ? (
            <AutocompleteSection title="LiteLLM">
              {selectedProviderModels.map((model) => (
                <AutocompleteItem
                  data-testid={`model-item-${model}`}
                  key={model}
                >
                  {model}
                </AutocompleteItem>
              ))}
            </AutocompleteSection>
          ) : (
            <AutocompleteSection title={t(I18nKey.MODEL_SELECTOR$VERIFIED)}>
              {verifiedModels.map((model) => (
                <AutocompleteItem key={model}>{model}</AutocompleteItem>
              ))}
            </AutocompleteSection>
          )}
          {selectedProvider !== LITELLM_PROVIDER_ID && otherModels.length ? (
            <AutocompleteSection title={t(I18nKey.MODEL_SELECTOR$OTHERS)}>
              {otherModels.map((model) => (
                <AutocompleteItem
                  data-testid={`model-item-${model}`}
                  key={model}
                >
                  {model}
                </AutocompleteItem>
              ))}
            </AutocompleteSection>
          ) : null}
        </Autocomplete>
      </fieldset>
    </div>
  );
}

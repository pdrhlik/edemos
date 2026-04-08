package locale

import (
	"encoding/json"

	"github.com/nicksnyder/go-i18n/v2/i18n"
	"golang.org/x/text/language"
)

type Translator struct {
	T func(string, ...map[string]interface{}) string
}

type translations struct {
	localizer *i18n.Localizer
}

func (t *translations) T(key string, data ...map[string]interface{}) string {
	var templateData map[string]interface{}
	if len(data) > 0 {
		templateData = data[0]
	}
	msg, err := t.localizer.Localize(&i18n.LocalizeConfig{
		MessageID:    key,
		TemplateData: templateData,
	})
	if err != nil {
		return key
	}
	return msg
}

func loadBundle() *i18n.Bundle {
	bundle := i18n.NewBundle(language.English)
	bundle.RegisterUnmarshalFunc("json", json.Unmarshal)
	bundle.LoadMessageFile("locales/en.json")
	bundle.LoadMessageFile("locales/cs.json")
	return bundle
}

func GetTranslationFunc(lang string) Translator {
	bundle := loadBundle()
	localizer := i18n.NewLocalizer(bundle, lang)
	t := &translations{localizer: localizer}
	return Translator{
		T: func(key string, data ...map[string]interface{}) string {
			return t.T(key, data...)
		},
	}
}

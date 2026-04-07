package slug

import (
	"crypto/rand"
	"encoding/hex"
	"regexp"
	"strings"
)

var (
	nonAlphaNum = regexp.MustCompile(`[^a-z0-9-]+`)
	multiDash   = regexp.MustCompile(`-{2,}`)
)

// transliteration map for Czech and common diacritics
var translitMap = map[rune]string{
	'á': "a", 'č': "c", 'ď': "d", 'é': "e", 'ě': "e",
	'í': "i", 'ň': "n", 'ó': "o", 'ř': "r", 'š': "s",
	'ť': "t", 'ú': "u", 'ů': "u", 'ý': "y", 'ž': "z",
	'Á': "a", 'Č': "c", 'Ď': "d", 'É': "e", 'Ě': "e",
	'Í': "i", 'Ň': "n", 'Ó': "o", 'Ř': "r", 'Š': "s",
	'Ť': "t", 'Ú': "u", 'Ů': "u", 'Ý': "y", 'Ž': "z",
	'ä': "a", 'ö': "o", 'ü': "u", 'ß': "ss",
	'Ä': "a", 'Ö': "o", 'Ü': "u",
	'ł': "l", 'Ł': "l", 'ś': "s", 'Ś': "s",
	'ź': "z", 'Ź': "z", 'ć': "c", 'Ć': "c",
	'ñ': "n", 'Ñ': "n",
}

// Generate creates a URL-friendly slug from a title.
func Generate(title string) string {
	var b strings.Builder
	for _, r := range title {
		if repl, ok := translitMap[r]; ok {
			b.WriteString(repl)
		} else {
			b.WriteRune(r)
		}
	}

	s := strings.ToLower(b.String())
	s = nonAlphaNum.ReplaceAllString(s, "-")
	s = multiDash.ReplaceAllString(s, "-")
	s = strings.Trim(s, "-")

	if len(s) > 190 {
		s = s[:190]
		s = strings.TrimRight(s, "-")
	}

	if s == "" {
		s = "survey"
	}

	return s
}

// WithSuffix appends a random 4-character hex suffix to make a slug unique.
func WithSuffix(base string) string {
	b := make([]byte, 2)
	rand.Read(b)
	suffix := hex.EncodeToString(b)
	return base + "-" + suffix
}

#!/usr/bin/env bash
#
# Запускаем валидацию ESlint-ом всех файлов которые мы хотим закоммитить

# Подключаем функции-помощники
. "$(dirname $0)/utils.sh"

eslintPath="$(npm bin)/eslint"

if [ ! -e "$eslintPath" ]; then
    print_fail "ESlint не установлен локально в ваших зависимостях"
    exit 1
fi

# файлы которые хотим закоммитить
filesForCheck=$(git diff --cached --name-only --diff-filter=ACM HEAD | grep '.js$' | xargs echo)

# если список пустой, то ничего не дано проверять и просто выходим
if [ "$filesForCheck" == "" ]; then
    exit 0
fi

# вызываем eslint
$eslintPath $filesForCheck

if [ $? == 1 ]; then
    print_fail "Нельзя просто так взять и закоммитить код не по стайл гайду!"
    exit 1
fi

exit 0

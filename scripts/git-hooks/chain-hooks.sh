#!/usr/bin/env bash
#
# Запускаем все хуки с именами 'hookName-*'(например: 'pre-commit-*'),
# если хоть один из них выпал с ошибкой, то и мы выходим с ошибкой

data=$(cat)
exitcodes=()
hookname=`basename $0`

# Получить строку команды с которой был вызван git
export INVOKED_COMMAND=$(ps -ocommand= -p $PPID)

# запускаем в цикле хуки и накапливаем их результат выполнения
for hook in $0-*; do
  test -x "$hook" || continue
  echo "$data" | "$hook"
  exitcodes+=($?)
done

unset INVOKED_COMMAND

# если хоть один из них выпал с ошибкой выходим и мы с ошибкой
for i in "${exitcodes[@]}"; do
  [ "$i" == 0 ] || exit $i
done

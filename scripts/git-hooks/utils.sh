#!/usr/bin/env bash
#
# Некоторые полезные функции

_COLOR_RED=$(printf '\e[0;31m')
_COLOR_GREEN=$(printf '\e[0;32m')
_COLOR_YELLOW=$(printf '\e[0;33m')
_COLOR_CYAN=$(printf '\e[0;36m')
_COLOR_MAGENTA=$(printf '\e[0;35m')
_COLOR_DEFAULT=$(printf '\e[m')
_ICON_CROSS=$(printf $_COLOR_RED'✘'$_COLOR_DEFAULT)
_ICON_TICK=$(printf $_COLOR_GREEN'✔'$_COLOR_DEFAULT)

HOOK_NAME=$(basename $0)

# Вывести сообщение в консоль
function print_msg {
    echo -e "[$_COLOR_CYAN$HOOK_NAME$_COLOR_DEFAULT]: $1"
}

# Вывести сообщение об ошибке
function print_fail {
    echo -e " $_ICON_CROSS [$_COLOR_CYAN$HOOK_NAME$_COLOR_DEFAULT]: $1"
}

# Вывести сообщение об успехе
function print_ok {
    echo -e " $_ICON_TICK [$_COLOR_CYAN$HOOK_NAME$_COLOR_DEFAULT]: $1"
}

# Получить текущую ветку гита
function get_curr_branch {
    echo $(git rev-parse --abbrev-ref HEAD)
}

# Получить путь до рабочей директории проекта
function get_work_dir {
    echo $(git rev-parse --show-toplevel 2> /dev/null)
}

# Список файлов для коммита
function get_commit_files {
    echo $(git diff --cached --name-only --diff-filter=ACM HEAD)
}

# Список изменённых файлов
function get_changed_files {
    echo $(git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD)
}

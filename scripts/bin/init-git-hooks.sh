#!/usr/bin/env bash
#
# Устанавливает git-hook-и в проект
#
# Можно запустить с выводом сообщений в консоль, так:
# env VERBOSE=true ./scripts/bin/init-git-hooks.sh

all_hook_names="applypatch-msg pre-applypatch post-applypatch pre-commit pre-push prepare-commit-msg commit-msg post-commit pre-rebase post-checkout post-merge pre-receive update post-receive post-update pre-auto-gc"
hook_dir=".git/hooks"
tracked_dir="scripts/git-hooks"
requested_hook="$1"
utils_file_name="utils.sh"
chain_file_name="chain-hooks.sh"

function puts() {
    printf %s\\n "$*" ;
}

if [ ! -d ".git" ]; then
    puts 'Не найдена директория .git. Поднимитесь в корень проекта, либо заинитьте git-репозиторий' >&2
    exit 1
fi

if [ ! -x "$tracked_dir/$utils_file_name" ]; then
    puts " [!!!] файл '$tracked_dir/$utils_file_name' не имеет прав на выполнение или его не существует" >&2
    exit 1
fi

if [ ! -x "$tracked_dir/$chain_file_name" ]; then
    puts " [!!!] файл '$tracked_dir/$chain_file_name' не имеет прав на выполнение или его не существует" >&2
    exit 1
fi

mkdir -p "$hook_dir"

function install_hook() {
    local hook_name="$1"

    [ -n "$VERBOSE" ] && puts "Установка '$hook_name':" >&2

    # Если в папке с хуками уже есть хук и он не является symlink-ой, переименуем его с постфиксом "-local"
    if [ ! -h "$hook_dir/$hook_name" -a -x "$hook_dir/$hook_name" ]; then
        [ -n "$VERBOSE" ] && puts " [ + ] Переименовываем оригинальных хук '$hook_name' в '$hook_name-local' ..." >&2
        mv "$hook_dir/$hook_name" "$hook_dir/$hook_name-local" || exit 1
    fi

    # Ставим symlink на файл с функциями-помощниками для hook-ов
    rm "$hook_dir/$utils_file_name" 2>/dev/null
    ln -s "../../$tracked_dir/$utils_file_name" "$hook_dir/$utils_file_name"

    # удаляем старый хук
    rm "$hook_dir/$hook_name" 2>/dev/null

    # Ставим symlink с названием нашего хука(например: 'pre-commit') на файл chain-hooks.sh,
    # который в цикле будет запускать все наши 'pre-commit-*' хуки
    ln -s "../../$tracked_dir/$chain_file_name" "$hook_dir/$hook_name"

    for tracked_path in "$tracked_dir/$hook_name"/*; do
        if [ ! -x "$tracked_path" ]; then
            [ -n "$VERBOSE" ] && puts " [!!!] '$tracked_path' не имеет прав на выполнение!" >&2
            continue
        fi
        local full_filename=$(basename "$tracked_path")
        local hook_path="$hook_dir/$hook_name-${full_filename%.*}"
        [ -n "$VERBOSE" ] && puts " [ + ] '$hook_path' из $tracked_path" >&2

        # удаляем существующий symlink
        if [ -L "$hook_path" ]; then
            rm $hook_path
        fi

        # ставим symlink на наш актуальный хук
        ln -s "../../$tracked_path" "$hook_path" || exit 1
    done
}

if [ -n "$requested_hook" ]; then
    echo "$all_hook_names" | grep --quiet "$requested_hook" && install_hook $requested_hook
else
    for one_hook_name in $all_hook_names; do
        [ -d "$tracked_dir/$one_hook_name" ] && install_hook $one_hook_name
    done
fi

unset install_hook
unset puts

exit 0

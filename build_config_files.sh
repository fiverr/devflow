#!/bin/bash

function handle_errors {
    error_log_entry=`tail -1 $temp_log_file`
    echo -e "\e[31m$error_log_entry\e[0m"
}

function handle_exceptions {
    consul_template_rc=`echo $?`
    warn_log_entry=`grep \\\\[WARN\\\\] $temp_log_file`
    if [ $consul_template_rc -ne 0 ]; then
        handle_errors
        exit_code=1
    fi

    if [ "$warn_log_entry" != "" ]; then
        echo -e "\e[31m$warn_log_entry\e[0m"
        exit_code=1
    fi

    if [ $exit_code -eq 1 ]; then
        exit $exit_code
    fi
}

echo -e "\e[32mBuilding templates...\e[0m"

app_dir=$1/current
if [ -d $1/current ]; then
  app_dir=$1/current
else
  app_dir=$1
fi

if [ -d $1/shared/template_build_log ]; then
  temp_log_dir=$1/shared/template_build_log
else
  temp_log_dir=$1/template_build_log
fi

templates_dir=$app_dir/configuration/templates
config_dir=$app_dir/configuration
template_files=`ls $templates_dir/*.ctmpl`
temp_log_file=$temp_log_dir/consul_template_run.log
exit_code=0

if [ ! -d $temp_log_dir ]; then
    mkdir $temp_log_dir
fi

for input_template_file in $template_files;
do
    base_template_file=`basename $input_template_file`
    config_file=`echo $base_template_file | sed s/.ctmpl//g`
    output_config_file=$config_dir/$config_file
    echo "building config file from $input_template_file..."
    consul-template -template "$input_template_file:$output_config_file:echo $output_config_file built." -once 2>$temp_log_file
    handle_exceptions
done

sudo service consul-template reload

echo -e "\e[32mFinished building templates\e[0m"

exit $exit_code

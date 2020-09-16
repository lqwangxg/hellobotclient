sh_cmd=$1
if [ -z "$sh_cmd" ]; then 
  sh_cmd="sh"
fi
echo "sh_cmd:$sh_cmd"

docker run -it --rm \
-v ~/vuechat/:/app \
lqwangxg/vue-cli \
$sh_cmd

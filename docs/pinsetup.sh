echo 16 > /sys/class/gpio/export
echo 20 > /sys/class/gpio/export
echo 21 > /sys/class/gpio/export

echo 'out' > /sys/class/gpio/gpio16/direction
echo 'out' > /sys/class/gpio/gpio20/direction
echo 'out' > /sys/class/gpio/gpio21/direction

echo 'test'
cat /sys/class/gpio/gpio16/value
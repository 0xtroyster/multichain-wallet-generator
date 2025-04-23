# วิธีติดตั้งและรัน Multichain Wallet Generator บน Ubuntu VPS

คู่มือนี้จะแนะนำวิธีการติดตั้งและรัน Multichain Wallet Generator บน Ubuntu VPS

## ข้อกำหนดของระบบ
- Ubuntu 18.04/20.04/22.04
- สิทธิ์ sudo

## วิธีการติดตั้ง

### 1. อัปเดตแพ็คเกจของระบบ
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 2. ติดตั้ง Node.js และ npm
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. ตรวจสอบว่าติดตั้งเรียบร้อย
```bash
node -v
npm -v
```

### 4. อัปโหลดไฟล์โปรเจค

มีสองวิธีที่คุณสามารถอัปโหลดไฟล์โปรเจคได้:

#### วิธีที่ 1: ใช้ Git Clone (ถ้าคุณใช้ GitHub)
```bash
git clone https://github.com/yourusername/o
cd multichain-wallet-generator
```

#### วิธีที่ 2: อัปโหลดด้วย SCP/SFTP
ให้อัปโหลดไฟล์ทั้งหมดในโปรเจคไปยัง VPS ของคุณ:
```bash
# รันบนเครื่องคุณเอง ไม่ใช่บน VPS
scp -r /path/to/local/project username@your-vps-ip:/path/on/vps
```

หรือใช้โปรแกรม SFTP เช่น FileZilla

### 5. เข้าไปยังไดเรกทอรีของโปรเจค
```bash
cd /path/to/project/on/vps
```

### 6. ติดตั้ง Dependencies
```bash
npm install
```

### 7. ให้สิทธิ์การรันสคริปต์
```bash=
chmod +x run.sh
```

## วิธีการรัน


หรือ
```bash
node index.js
```

## การแก้ไขปัญหา

### กรณี Node.js ใช้เวอร์ชันเก่าเกินไป
```bash
# ถอนการติดตั้ง Node.js เวอร์ชันเดิม
sudo apt-get remove nodejs

# ติดตั้งเวอร์ชันใหม่
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```


## คำเตือนความปลอดภัย
1. อย่าเก็บไฟล์ wallet ที่สร้างไว้บน VPS เป็นเวลานาน
2. แนะดาวน์โหลดไฟล์ wallet ที่สร้างขึ้นมายังเครื่องส่วนตัวและลบออกจาก VPS 
3. พิจารณาการใช้การเชื่อมต่อที่ปลอดภัย (SSH/SFTP) เสมอ
4. หากเป็นไปได้ ติดตั้งระบบไฟร์วอลล์และใช้งาน UFW (Uncomplicated Firewall)

## ข้อควรระวังเพิ่มเติม
การสร้าง wallet บน VPS อาจมีความเสี่ยงด้านความปลอดภัย โปรดระมัดระวังและใช้เฉพาะเมื่อจำเป็น 
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor(private readonly configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: configService.get<string>('MAIL_USER'),
                pass: configService.get<string>('MAIL_PASSWORD'),
            }
        })
    }

    async sendPasswordResetEmail(toEmail: string, token: string){
        const resetLink = `http://localhost:3000/profile/setting/reset-password?email=${toEmail}&token=${token}`;

        const mailOptions = {
            from: `"Let Quiz Support" <${this.configService.get<string>('MAIL_USER')}>`,
            to: toEmail,
            subject: "Yêu cầu đổi lại mật khẩu mới",
            html: `
                <h3>Xin chào!</h3>
                <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản trên Let Quiz.</p>
                <p>Vui lòng click vào đường link dưới đây để thiết lập mật khẩu mới. <b>Đường link này chỉ có hiệu lực trong 15 phút.</b></p>
                <a href="${resetLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Đổi Mật Khẩu Ngay</a>
                <br><br>
                <p>Nếu nút bấm không hoạt động, bạn có thể copy đường link sau dán vào trình duyệt:</p>
                <p><i>${resetLink}</i></p>
                <p>Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.</p>
            `,
        };

        await this.transporter.sendMail(mailOptions);
    }

    async sendDeleteAccountEmail(toEmail: string, token: string){
        const deleteLink = `http://localhost:3000/profile/setting/delete-account?email=${toEmail}&token=${token}`;

        const mailOptions = {
            from: `"Let Quiz Support" <${this.configService.get<string>('MAIL_USER')}>`,
            to: toEmail,
            subject: "Yêu cầu xoá tài khoản",
            html: `
                <h3>Xin chào!</h3>
                <p>Bạn vừa yêu cầu xoá tài khoản trên Let Quiz.</p>
                <p>Vui lòng click vào đường link dưới đây để thực hiện việc xoá tài khoản. <b>Đường link này chỉ có hiệu lực trong 15 phút.</b></p>
                <a href="${deleteLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Xoá tài khoản ngay</a>
                <br><br>
                <p>Nếu nút bấm không hoạt động, bạn có thể copy đường link sau dán vào trình duyệt:</p>
                <p><i>${deleteLink}</i></p>
                <p>Nếu bạn không yêu cầu xoá tài khoản, vui lòng bỏ qua email này.</p>
            `
        };

        await this.transporter.sendMail(mailOptions);
    }
}

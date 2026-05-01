import { useMutation } from '@tanstack/react-query';
import { history, Link } from '@umijs/max';
import {
  Button,
  Form,
  Input,
  message,
  Popover,
  Progress,
  Select,
} from 'antd';
import type { Store } from 'antd/es/form/interface';
import type { FC } from 'react';
import { useState } from 'react';
import { fakeRegister } from './service';
import useStyles from './styles';

const FormItem = Form.Item;

const passwordProgressMap: {
  ok: 'success';
  pass: 'normal';
  poor: 'exception';
} = {
  ok: 'success',
  pass: 'normal',
  poor: 'exception',
};
const Register: FC = () => {
  const { styles } = useStyles();
  const [open, setVisible]: [boolean, any] = useState(false);
  const [popover, setPopover]: [boolean, any] = useState(false);
  const confirmDirty = false;

  const passwordStatusMap = {
    ok: (
      <div className={styles.success}>
        <span>强度：强</span>
      </div>
    ),
    pass: (
      <div className={styles.warning}>
        <span>强度：中</span>
      </div>
    ),
    poor: (
      <div className={styles.error}>
        <span>强度：太短</span>
      </div>
    ),
  };

  const [form] = Form.useForm();
  const getPasswordStatus = () => {
    const value = form.getFieldValue('password');
    if (value && value.length > 9) {
      return 'ok';
    }
    if (value && value.length > 5) {
      return 'pass';
    }
    return 'poor';
  };
  const { isPending: submitting, mutate: register } = useMutation({
    mutationFn: (formValues: Store) => {
      const payload = {
        username: formValues.username,
        password: formValues.password,
        confirm: formValues.confirm,
        realName: formValues.realName,
        roleType: formValues.roleType,
      };
      return fakeRegister(payload);
    },
    onSuccess: (data, params) => {
      if (data.status === 'ok') {
        message.success('注册成功！');
        history.push({
          pathname: `/user/register-result?account=${params.username}`,
        });
      }
    },
  });
  const onFinish = (values: Store) => {
    register(values);
  };
  const checkConfirm = (_: any, value: string) => {
    const promise = Promise;
    if (value && value !== form.getFieldValue('password')) {
      return promise.reject('两次输入的密码不匹配!');
    }
    return promise.resolve();
  };
  const checkPassword = (_: any, value: string) => {
    const promise = Promise;
    // 没有值的情况
    if (!value) {
      setVisible(!!value);
      return promise.reject('请输入密码!');
    }
    // 有值的情况
    if (!open) {
      setVisible(!!value);
    }
    setPopover(!popover);
    if (value.length < 6) {
      return promise.reject('');
    }
    if (value && confirmDirty) {
      form.validateFields(['confirm']);
    }
    return promise.resolve();
  };
  const renderPasswordProgress = () => {
    const value = form.getFieldValue('password');
    const passwordStatus = getPasswordStatus();
    return value?.length ? (
      <div
        className={styles[`progress-${passwordStatus}` as keyof typeof styles]}
      >
        <Progress
          status={passwordProgressMap[passwordStatus]}
          size={6}
          percent={value.length * 10 > 100 ? 100 : value.length * 10}
          showInfo={false}
        />
      </div>
    ) : null;
  };
  return (
    <div className={styles.main}>
      <h3>注册 MathPaper 账号</h3>
      <Form
        form={form}
        name="UserRegister"
        initialValues={{ roleType: 'student' }}
        onFinish={onFinish}
      >
        <FormItem
          name="username"
          rules={[
            {
              required: true,
              message: '请输入账号!',
            },
          ]}
        >
          <Input size="large" placeholder="账号" />
        </FormItem>
        <FormItem
          name="realName"
          rules={[
            {
              required: true,
              message: '请输入姓名!',
            },
          ]}
        >
          <Input size="large" placeholder="姓名" />
        </FormItem>
        <FormItem
          name="roleType"
          rules={[
            {
              required: true,
              message: '请选择角色!',
            },
          ]}
        >
          <Select
            size="large"
            options={[
              { label: '学生', value: 'student' },
              { label: '教师', value: 'teacher' },
            ]}
          />
        </FormItem>
        <Popover
          getPopupContainer={(node) => {
            if (node?.parentNode) {
              return node.parentNode as HTMLElement;
            }
            return node;
          }}
          content={
            open && (
              <div
                style={{
                  padding: '4px 0',
                }}
              >
                {passwordStatusMap[getPasswordStatus()]}
                {renderPasswordProgress()}
                <div
                  style={{
                    marginTop: 10,
                  }}
                >
                  <span>请至少输入 6 个字符。请不要使用容易被猜到的密码。</span>
                </div>
              </div>
            )
          }
          overlayStyle={{
            width: 240,
          }}
          placement="right"
          open={open}
        >
          <FormItem
            name="password"
            className={
              form.getFieldValue('password') &&
              form.getFieldValue('password').length > 0 &&
              styles.password
            }
            rules={[
              {
                validator: checkPassword,
              },
            ]}
          >
            <Input
              size="large"
              type="password"
              placeholder="至少6位密码，区分大小写"
            />
          </FormItem>
        </Popover>
        <FormItem
          name="confirm"
          rules={[
            {
              required: true,
              message: '确认密码',
            },
            {
              validator: checkConfirm,
            },
          ]}
        >
          <Input size="large" type="password" placeholder="确认密码" />
        </FormItem>
        <FormItem>
          <div className={styles.footer}>
            <Button
              size="large"
              loading={submitting}
              className={styles.submit}
              type="primary"
              htmlType="submit"
            >
              <span>注册</span>
            </Button>
            <Link to="/user/login" prefetch>
              <span>使用已有账户登录</span>
            </Link>
          </div>
        </FormItem>
      </Form>
    </div>
  );
};
export default Register;
